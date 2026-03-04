import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    comparePassword: (candidate: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
},
    { timestamps: true });

//hashing the password before saving 
userSchema.pre("save", async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

//method to compare passwords

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);