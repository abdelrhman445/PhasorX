// تحقق بسيط من البيانات المدخلة قبل تسجيل الدخول أو إنشاء الحساب
export const validateAuthInput = (data: { email?: string; password?: string; name?: string }) => {
  if (data.email && !data.email.includes('@')) {
    return { valid: false, message: 'البريد الإلكتروني غير صالح' };
  }
  if (data.password && data.password.length < 6) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  return { valid: true };
};