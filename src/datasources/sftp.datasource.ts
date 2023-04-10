import * as dotenv from 'dotenv';
dotenv.config();
let Client = require('ssh2-sftp-client');
let sftp = new Client();

const config = {
  host: '192.168.0.4',
  port: '43313',
  username: 'selecro-dev',
  password: 'lny748*#IFisc@@',
};

sftp.connect(config).then(() => {
  return sftp.list('/');
}).then((data: any) => {
  console.log(data, 'the data info');
}).catch((err: any) => {
  console.log(err, 'catch error');
});
