# Backend with javascript 

## Step 10: How to upload file in backend.
- Multer (express-fileupload)
- Cloudinary(a place where we can store the images and videos and get url of that)
- Using Multer we will take files from user and keep temp. on our local server and then we will take that file by using cloudinary and keep them on server.
- we can do direct also.

## Step 11: HTTP Guids

## Step 12: Router and Cotroller 
- Router Files -- It maps URLs to specific functions in the controller.
- Controller Files -- The controller file contains the business logic for handling requests.

```
// Using router.route() for multiple methods
router.route('/register')
  .get(showRegistrationForm)  // Handle GET requests to show the registration form
  .post(registerUser);        // Handle POST requests to register a new user

// Using router.post() for a single method
router.post('/login', loginUser);  // Handle POST requests to log in a user 
``
