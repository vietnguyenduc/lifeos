# PRE-PUSH CHECKLIST

## Checklist khi chuẩn bị push code

- [ ] Định nghĩa rõ ràng type/interface cho mọi object/mảng
- [ ] Khai báo type cho tham số trong map/filter/reduce
- [ ] Xóa biến/const không dùng
- [ ] Chạy `npm run type-check` trước khi push
- [ ] Kiểm tra script prepare đa nền tảng (node script, không dùng shell if)
- [ ] Xem lại file `PRE-PUSH-CHECKLIST.md` trước khi push code

## Lưu ý

- Luôn chạy `npm run health-check` trước khi push
- Đảm bảo không có lỗi TypeScript
- Kiểm tra responsive design trên mobile và desktop
- Verify dependencies với `npm run verify-deps`
