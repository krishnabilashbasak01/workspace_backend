module.exports = {
  apps: [
    {
      name: "tbmworkspaceapi",
      script: "./app.js",
      instance: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        REDIS_USER: "default",
        REDIS_PASSWORD: "IMyZFLwpxqCuSfzvi2Ui1FVbAygIFpYz",
        REDIS_HOST: "redis-19288.c270.us-east-1-3.ec2.redns.redis-cloud.com",
        REDIS_PORT: 19288,
        DATABASE_URL: 'mysql://u884132900_workspace_beta:Krishnabasak01@193.203.184.123:3306/u884132900_workspace_beta',
        SHADOW_DATABASE_URL: 'mysql://u884132900_shadow_datadb:Krishnabasak01@193.203.184.123:3306/u884132900_shadow_datadb',
        MONGO_URI: 'mongodb+srv://2022krishnabasak:Krishnabasak01@cluster0.rjqrjan.mongodb.net/tbm_work_flow'
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        REDIS_USER: "default",
        REDIS_PASSWORD: "0Hgvu2Ink483EdXtTKgYPlId8DepKlcy",
        REDIS_HOST: "redis-16679.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
        REDIS_PORT: 16679,
        DATABASE_URL: 'mysql://u884132900_workspace:Krishnabasak01@193.203.184.123:3306/u884132900_workspace',
        SHADOW_DATABASE_URL: 'mysql://u884132900_shadow_datadb:Krishnabasak01@193.203.184.123:3306/u884132900_shadow_datadb',
        MONGO_URI: 'mongodb+srv://2022krishnabasak:Krishnabasak01@cluster0.rjqrjan.mongodb.net/tbm_work_flow'
      },
      autorestart: true,
      watch: false,
    },
  ],
};
