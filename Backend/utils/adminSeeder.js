import bcrypt from "bcryptjs";
import User from "../Models/User.js";

const seedAdmin = async () => {
    try {
        const adminId = "ADMINKG";
        const passwordPlain = "ADMINKG@110125";

        const existingAdmin = await User.findOne({ adminId });

        if (!existingAdmin) {
            console.log("🚀 Seeding Default Admin Account...");

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordPlain, salt);

            await User.create({
                name: "Platform Admin",
                adminId,
                password: hashedPassword,
                role: "admin",
                provider: "password",
                isEmailVerified: true
                // Note: email is omitted as we use adminId
            });

            console.log("✅ Admin Account Created Successfully!");
        } else {
            // console.log("ℹ️ Admin Account Already Exists.");
        }
    } catch (error) {
        console.error("❌ Error Seeding Admin:", error.message);
    }
};

export default seedAdmin;
