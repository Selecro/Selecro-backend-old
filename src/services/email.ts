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

  public generateVerificationToken(userId: number): string {
    const secret = process.env.JWT_SECRET ?? '';
    const token = jwt.sign({userId}, secret, {expiresIn: '1h'});
    return token;
  }

  async sendRegistrationEmail(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/verification?token=${token}`;
    const body = fs.readFileSync(`./src/html/registration${user.language}.html`, 'utf-8');
    body.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Registration',
      html: body,
    });
  }

  async sendResetEmail(user: User, email: string | undefined): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/verication?token=${token}`;
    const body0 = fs.readFileSync(`./src/html/verification${user.language}.html`, 'utf-8');
    const body1 = fs.readFileSync(`./src/html/emailInfo${user.language}.html`, 'utf-8');
    body0.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: email,
      subject: 'Selecro: Email verification',
      html: body0,
    });
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Email change',
      html: body1,
    });
  }

  async sendPasswordChange(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/passwdchange?token=${token}`;
    const body = fs.readFileSync(`./src/html/passwordChange${user.language}.html`, 'utf-8');
    body.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Change password',
      html: body,
    });
  }

  async sendSuccessfulyPasswordChange(user: User): Promise<void> {
    const body = fs.readFileSync(`./src/html/successfulyPasswordChange${user.language}.html`, 'utf-8');
    await EmailDataSource.sendMail({
      from: process.env.EMAILUSER,
      to: user.email,
      subject: 'Selecro: Successfuly changed password',
      html: body,
    });
  }
}
