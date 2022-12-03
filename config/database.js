import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB connected to the server: ${data.connection.host}`);
    });
};

export default connectDB;
