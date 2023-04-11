import {bind, BindingScope} from '@loopback/core';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {EmailDataSource} from '../datasources';
import {User} from '../models';
const fs = require('fs');
dotenv.config();

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  constructor() { }

  async sendVerificationEmail(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/verify-email?token=${token}`;
    const body = fs.readFileSync(`./src/html/registration0${user.language}.html`, 'utf-8') + `Hi ${user.username},<br/><br/>Please verify your email address by clicking <a href="${url}">this link</a>.<br/><br/>Best,Token vyprsi za 1 hodinu<br/>MyApp` + fs.readFileSync(`./src/html/registration1${user.language}.html`, 'utf-8');
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Verify email address',
      html: body,
    });
  }

  public generateVerificationToken(userId: number): string {
    const secret = process.env.JWT_SECRET ?? '';
    const token = jwt.sign({userId}, secret, {expiresIn: '1h'});
    return token;
  }

  async sendResetEmail(user: User, email: string | undefined): Promise<void> {
    const body = fs.readFileSync(`./src/html/emailchange${user.language}.html`, 'utf-8');
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Email change',
      html: body,
    });
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: email,
      subject: 'Selecro: Email change',
      html: body,
    });
  }
}
