import mongoose from 'mongoose';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/homecare');
  console.log('Connected to MongoDB');

  // 1. Cập nhật tài khoản Lan Nguyễn (Helper)
  const lanUser = await User.findOne({ email: 'lan.nguyen@giupviec24.vn' });
  if (lanUser) {
    lanUser.kycLevel = 2;
    lanUser.kyc = {
      status: 'APPROVED',
      fullName: 'Nguyễn Thị Lan',
      idNumber: '001198001234',
      submittedAt: new Date(),
      reviewedAt: new Date(),
    };
    lanUser.wallet = { available: 1500000, locked: 0 };
    lanUser.bank = { bankName: 'Vietcombank', accountNumber: '0123456789', accountName: 'NGUYEN THI LAN' };
    await lanUser.save();

    // Link Worker W-01 to lanUser._id
    await Worker.findOneAndUpdate(
      { code: 'W-01' },
      { $set: { userId: lanUser._id } }
    );
    console.log('Updated Helper Lan Nguyen to KYC 2 and linked Worker W-01');
  }

  // 2. Cập nhật tài khoản CleanPro (Enterprise)
  const cleanProUser = await User.findOne({ email: 'dn@cleanpro.vn' });
  if (cleanProUser) {
    cleanProUser.kycLevel = 2;
    cleanProUser.kyc = {
      status: 'APPROVED',
      companyName: 'Công ty TNHH Dịch vụ CleanPro',
      taxCode: '0109988776',
      submittedAt: new Date(),
      reviewedAt: new Date(),
    };
    cleanProUser.wallet = { available: 5200000, locked: 0 };
    cleanProUser.bank = { bankName: 'Techcombank', accountNumber: '19034567890123', accountName: 'CONG TY CLEANPRO' };
    cleanProUser.employees = [
      {
        id: 'EMP-01',
        name: 'Trần Thị Mai',
        phone: '0901112233',
        birthYear: 1988,
        gender: 'Nữ',
        status: 'AVAILABLE',
      },
      {
        id: 'EMP-02',
        name: 'Lê Văn Hùng',
        phone: '0904445566',
        birthYear: 1992,
        gender: 'Nam',
        status: 'AVAILABLE',
      },
      {
        id: 'EMP-03',
        name: 'Phạm Thu Trang',
        phone: '0907778899',
        birthYear: 1995,
        gender: 'Nữ',
        status: 'AVAILABLE',
      },
    ];
    await cleanProUser.save();
    console.log('Updated Enterprise CleanPro with KYC 2 and 3 employees');
  }

  console.log('Seed completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

