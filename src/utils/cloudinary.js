import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'



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
            console.error('Error uploading file to Cloudinary:', error);
            if (fs.existsSync(localFilePath)) {
                try {
                    fs.unlinkSync(localFilePath);
                    console.log('Local file deleted:', localFilePath);
                } catch (unlinkError) {
                    console.error('Error deleting local file:', unlinkError);
                }
            } else {
                console.warn('Local file does not exist, cannot delete:', localFilePath);
            }
        }
    }

    export {uploadFileCloudinary};