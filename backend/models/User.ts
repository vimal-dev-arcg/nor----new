import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      default: function (this: any) {
        return this.name || (this.email ? this.email.split("@")[0] : "admin");
      },
    },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "admin", "buyer", "dealer", "checker", "finance"],
      default: "admin",
    },
    phone: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("validate", function () {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  } else if (!this.username && this.name) {
    this.username = this.name.toLowerCase().replace(/\s+/g, "");
  } else if (!this.username) {
    this.username = "admin";
  }
});

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
