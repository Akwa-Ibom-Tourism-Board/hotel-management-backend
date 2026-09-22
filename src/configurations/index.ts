import merge from 'lodash.merge'
import dotenv from 'dotenv'

dotenv.config()

const stage: any = process.env.NODE_ENV;
let config

if(stage === "development"){
    config = require("./development").default
}else if(stage === "production"){
    config = require("./production").default
}

const {
  APP_SECRET,
  SENDGRID_API_KEY,
  TERMI_API_KEY,
  TERMI_BASE_URL,
  TERMI_SECRET_KEY,
} = process.env;

export default merge(
  {
    stage,
    APP_SECRET,
    SENDGRID_API_KEY,
    TERMI_API_KEY,
    TERMI_BASE_URL,
    TERMI_SECRET_KEY,
  },
  config,
)