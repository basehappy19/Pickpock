import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.auth.resetEmailDesc = "Please enter your registered email to receive a verification code.";
enData.auth.verifyOtpTitle = "Verify OTP";
enData.auth.backToEmail = "Back to Email";
enData.auth.otpVerifiedDesc = "OTP Verified. Please enter your new password.";

thData.auth.resetEmailDesc = "กรุณากรอกอีเมลที่ลงทะเบียนไว้เพื่อรับรหัสยืนยัน";
thData.auth.verifyOtpTitle = "ยืนยันรหัส OTP";
thData.auth.backToEmail = "กลับไปกรอกอีเมล";
thData.auth.otpVerifiedDesc = "ยืนยัน OTP สำเร็จ กรุณากำหนดรหัสผ่านใหม่";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added email reset translations.');
