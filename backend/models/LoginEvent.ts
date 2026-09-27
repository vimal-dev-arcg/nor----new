import mongoose, { Schema, Document } from "mongoose";

export interface ILoginEvent extends Document {
  username: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  status: string;
  role?: string;
  timestamp: Date;
}

const LoginEventSchema = new Schema<ILoginEvent>(
  {
    username: {
      type: String,
      required: true,
      default: function (this: any) {
        return this.email ? this.email.split("@")[0] : "admin";
      },
    },
    email: { type: String, default: "" },
    ip: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "" },
    status: { type: String, default: "success" },
    role: { type: String, default: "admin" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to make sure username is always set if only email is passed
LoginEventSchema.pre("validate", function () {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  } else if (!this.username) {
    this.username = "admin";
  }
});

export const LoginEventModel =
  mongoose.models.LoginEvent ||
  mongoose.model<ILoginEvent>("LoginEvent", LoginEventSchema);
