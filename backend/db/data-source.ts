import { DataSourceOptions ,DataSource} from "typeorm";
import * as dotenv from 'dotenv'
dotenv.config()
export const dataSourceOptions :DataSourceOptions = {
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT as any,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    synchronize:false,
    timezone: '+07:00', // Set to UTC+7 for Ho Chi Minh City
    // logging: true
    extra: {
    connectionLimit: 10,
    connectTimeout: 10000,
    // Giữ kết nối luôn mở
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true,
  },
} 

console.log('dataSourceOptions: ', dataSourceOptions);
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

