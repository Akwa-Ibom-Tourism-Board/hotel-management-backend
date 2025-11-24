import { Transaction } from "sequelize";
import OtpModel from "../../models/otp/otp";

const otpRepositories = {
  create: async (data: any, transaction?: Transaction | null) => {
    try {
      const newOtp = await OtpModel.create(data, {
        transaction: transaction ?? null,
      });
      return newOtp;
    } catch (error: any) {
      throw new Error(`Error creating Otp: ${error.message}`);
    }
  },

  handleUpdates: async (update: any, options: any) => {
    try {
      const [affectedRows] = await OtpModel.update(
        update,
        options
      );
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Otp: ${error.message}`);
    }
  },

  //   deleteOne: async (filter: any) => {
  //     try {
  //       const establishment = await OtpModel.findOne({
  //         where: filter,
  //       });
  //       if (!establishment)
  //         throw new Error("Establishment not found in our database");
  //       await establishment.destroy();
  //       return establishment;
  //     } catch (error: any) {
  //       throw new Error(`Error deleting establishment: ${error.message}`);
  //     }
  //   },

  getOne: async (
    filter: Record<string, any>,
    projection: any = null,
  ) => {
    try {
      const otp = await OtpModel.findOne({
        where: filter,
        attributes: projection,
        // order: [['createdAt', 'DESC']]
      });
      return otp;
    } catch (error: any) {
      throw new Error(`Error fetching Otp: ${error.message}`);
    }
  },
};

export default otpRepositories;
