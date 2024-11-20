import { MongoInvalidArgumentError, Timestamp} from "mongodb";
import mongoose from "mongoose";    
import becrypt from "becryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique : [true, "Email already exists"],
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [6, "Password must be up to 6 characters"],
    },
    cartItems: {
        quantity: {
            type: Number,
            default: 1,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    },
    role: {
        type: String,
        enum: ["cutomer", "admin"],
        default: "customer",
    },
    Timestamp: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}) 


const User = mongoose.model("User", userSchema);

// pre-save hook to hash password before saving to database

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    try {
        const salt = await becrypt.genSalt(10);
        this.password = await becrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await becrypt.compare(password, this.password);
};



export default User;