const dotenv = require('dotenv');

const connectDB = require('./db/connection');
dotenv.config({ path: '../.env' });

const app = require('./app');

connectDB();
//   .then(() => {})
//   .catch((err) => {
//     console.log('Mongodb failed to connect', err);
//   });

app.on('Error', (err) => {
  console.log(`Error : `, err);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is started at PORT ${process.env.PORT}`);
});
