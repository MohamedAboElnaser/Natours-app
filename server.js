const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UncaughtedExcepton happen 💥💥', err);
  process.exit();
});
// the arrange is important here :)
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Concection stablished succesfuly'))
  .catch((err) => {
    console.log(`There is error 😡`, err);
  });

const port = process.env.PORT || 3000;
///-------------------
const server = app.listen(port, () => {
  if (!module.child)
    console.log(
      `Server is running in ${process.env.NODE_ENV} environment at Port: ${port} ....`
    );
});

//Global handleing the unhandled rejected promises

process.on('unhandledRejection', () => {
  console.log('Unhandled Rejection happen 😡');
  server.close(() => {
    console.log('shut down...');
    process.exit(1);
  });
});
