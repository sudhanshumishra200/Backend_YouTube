import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
    });

    const uploadFileCloudinary = async function (localFilePath){
        try {
            if(!localFilePath) return null;
            const response = await cloudinary.uploader.upload
            (
                localFilePath, {
                    resource_type: "auto",
                }
            )
            console.log("File is uploded on cloudinary", response.url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation for failed
            return null; 
        }
    }

    export {uploadFileCloudinary};