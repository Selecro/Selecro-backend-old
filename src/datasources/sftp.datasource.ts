import * as dotenv from 'dotenv';
dotenv.config();
let Client = require('ssh2-sftp-client');
let sftp = new Client();

const config = {
  host: process.env.SFTPHOST,
  port: Number(process.env.SFTPPORT),
  username: process.env.SFTPUSERNAME,
  password: process.env.SFTPPASSWORD,
};

sftp.connect(config).then(() => {
  return sftp.get("profile/1.png");
}).then((data: any) => {
  console.log(data, 'the data info');
  return sftp.end();
}).catch((err: any) => {
  console.log(err, 'catch error');
});
