import zod from 'zod';

const zodUserSchema = zod.object({
    username: zod.string().min(1, { message: "Username cannot be empty" }),
    fullName: zod.string().min(1, { message: "Fullname cannot be empty" }),
    email: zod.string().email({ message: "Invalid email address" }),
    password: zod.string().min(6, { message: "Password must be at least 6 characters long" }),
    avatarUrl: zod.string().url().optional(),
    coverImageUrl: zod.string().url().optional(),
  });


  export default zodUserSchema
