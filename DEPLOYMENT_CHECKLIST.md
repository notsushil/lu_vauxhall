# Deployment Checklist

## ✅ Pre-Deployment
- [ ] Environment variables set in Vercel dashboard:
  - [ ] RESEND_API_KEY (your actual Resend API key)
  - [ ] MAIL_FROM (LevelUp Reports <onboarding@resend.dev>)
  - [ ] REPORT_TO (dhakalsushil02@gmail.com)
- [ ] Code changes committed and pushed to GitHub
- [ ] Email address updated in both test file and main app

## ✅ Post-Deployment
- [ ] Vercel deployment completed successfully
- [ ] No build errors in Vercel logs
- [ ] App loads correctly in browser
- [ ] Form submission works without errors
- [ ] Email received at dhakalsushil02@gmail.com
- [ ] Check spam folder if email not in inbox

## 🔧 Troubleshooting
If email sending still fails:
1. Check browser console for specific error messages
2. Verify environment variables are set correctly in Vercelre_6ZSdrDUD_NQ6Htzhk8mWdwyBtBnzGEef3
3. Check Resend dashboard for API key status
4. Ensure Resend account is verified
5. Try the test script locally first

## 📧 Testing
1. Fill out the form with test data
2. Click "Submit Report"
3. Check for success/error message
4. Verify email arrives within 1-2 minutes
5. Check email content and attachment
