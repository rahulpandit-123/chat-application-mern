import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'


dotenv.config({
  path: "../../.env"
});

    cloudinary.config({ 
        cloud_name: process.env.cloudinary_name , 
        api_key:process.env.cloudinary_apikey , 
        api_secret:process.env.cloudinary_secret_key 
    }); 

export default cloudinary