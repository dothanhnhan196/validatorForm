import { default as Validator } from './validator.js';


// mong muốn ouput khi nhận được
Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        Validator.isRequired('#fullname', 'Tên đầy đủ không được bỏ trống'),
        Validator.isRequired('#email', 'Email không được bỏ trống'),
        Validator.isEmail('#email'),
        Validator.isRequired('#password', 'Email không được bỏ trống'),
        Validator.minLenghth('#password', 6, ),
        Validator.isRequired('#password_confirmation', 'Mật khẩu nhập lại không được bỏ trống'),
        Validator.isConfirmmed('#password_confirmation', function() {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không chính xác'),
    ],
    onSubmit: function(data) {
        // call api
        console.log(data);
    }
});