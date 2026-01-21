// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * ユーザー新規登録
   */
  async register(email: string, pass: string, name?: string) {
    // 1. ユーザーが既に存在するか確認
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('ユーザーは既に存在します');
    }

    // 2. パスワードをハッシュ化
    const saltOrRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(pass, saltOrRounds);

    // 3. データベースに保存
    const user = await this.prisma.user.create({
      data: {
        email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        name,
      },
    });

    // メール送信処理
    try {
      await this.mailService.sendMail(
        user.email,
        'シネログへようこそ！!',
        `<h1>こんにちは、 ${user.name || 'ユーザー'}。</h1><p>シネログへようこそ！ アカウントが正常に作成されました。</p>`,
      );
    } catch (error) {
      // メールの送信失敗でユーザー登録自体を失敗させないよう、ログに留めるのが一般的です
      console.error('登録メールの送信に失敗しました:', error);
    }

    return {
      message: 'ユーザーが正常に作成されました',
      userId: user.id,
    };
  }

  /**
   * ログイン認証 & JWT発行
   */
  async login(email: string, password: string) {
    // 1. ユーザーを検索
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('無効な資格情報');
    }

    // 2. パスワードの比較 (入力された平文 vs DBのハッシュ)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('無効な資格情報');
    }

    // 3. JWT トークンを発行
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // 4. パスワードリセット用のメソッド
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合もエラーは出さず「送信しました」と見せかけるのが一般的です
      return {
        message:
          'そのメールアドレスのアカウントが存在する場合は、リセット リンクが送信されています。',
      };
    }

    // 1. 一時的なトークンを生成（uuidなど）
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1時間有効

    // 2. DBに保存
    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    // 3. メール送信
    await this.mailService.sendMail(
      user.email,
      'パスワードリセットリクエスト',
      `<p>パスワードのリセットをリクエストしました。 <a href="http://localhost:3000/auth/reset-password?token=${token}">ここ</a> をクリックしてリセットしてください。</p>`,
    );

    return { message: 'リセットリンクがメールで送信されました。' };
  }

  /**
   * パスワードリセット：実際の更新処理
   */
  async resetPassword(token: string, newPassword: string) {
    // 1. トークンが有効か（存在し、期限内か）チェック
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }, // 現在時刻より後（期限内）
      },
    });

    if (!user) {
      throw new BadRequestException('無効または期限切れのトークン');
    }

    // 2. 新しいパスワードをハッシュ化
    const saltOrRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);

    // 3. パスワードを更新し、トークンをクリアする
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        resetToken: null, // 使用済みトークンを消去
        resetTokenExpires: null, // 期限を消去
      },
    });

    return { message: 'パスワードが正常にリセットされました' };
  }
}
