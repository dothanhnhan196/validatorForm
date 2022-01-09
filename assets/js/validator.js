export default function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};

    // hàm thực hiện kiểm tra input
    function validate(inputElement, rule) {
        // hàm kiểm tra: rule.test
        // value người dùng nhập vào: inputElement.value
        let errorMessage;
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // lấy ra các rules của selector
        let rules = selectorRules[rule.selector];
        // lặp qua từng rule & kiểm tra, Nếu có lỗi thì dừng việc kiểm tra
        for (let i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case "checkbox":
                case "radio":
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        }

        // trả về true nếu có lỗi | undefined
        return !errorMessage;
    }

    // lấy element của form cần kiểm tra (validate)
    let formElement = document.querySelector(options.form);
    if (formElement) {
        // khi submit form
        formElement.onsubmit = function(e) {
            // bỏ đi hành vi mặc định
            e.preventDefault();

            let isFormValid = true;

            // lặp qua từng rules và validate
            options.rules.forEach((rule) => {
                let inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // trường hợp submit với js
                if (typeof options.onSubmit === "function") {
                    let enableInput = formElement.querySelectorAll("[name]:not([disable])");
                    // ép kiểu thành array
                    let formValues = Array.from(enableInput).reduce((values, input) => {
                        // Xử lý input, checkbox,...
                        switch (input.type) {
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;

                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;

                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});

                    options.onSubmit(formValues);
                } else {
                    // trường hợp submit mặc định
                    formElement.submit();
                }
            }
        };

        // lặp qua mỗi rules và xử lý (lắng nghe event: blur, input,...)
        options.rules.forEach((rule) => {
            // lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            let inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach((inputElement) => {
                // xử lý trường hợp click chuột ra khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                };

                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = () => {
                    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                };

                inputElement.onchange = () => {
                    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                };
            });
        });
    }
}

// định nghĩa các rules
/* 
    nguyên tắc
    1. khi có lỗi => trả ra message lỗi
    2. khi hợp lệ => không trả ra gì cả (undefined)
*/
Validator.isRequired = (selector, message) => {
    return {
        selector,
        test: (value) => {
            if (typeof value === "string") {
                return value.trim() ? undefined : message || "Vui lòng nhập trường này";
            }
            return value ? undefined : message || "Vui lòng nhập trường này";
        },
    };
};

Validator.isEmail = (selector, message) => {
    return {
        selector,
        test: (value) => {
            let regex =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return value.toLowerCase().match(regex) ?
                undefined :
                message || "Email không hợp lệ";
        },
    };
};

Validator.minLenghth = (selector, min, message) => {
    return {
        selector,
        test: (value) => {
            return value.length >= min ?
                undefined :
                message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
    };
};

Validator.isConfirmmed = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: (value) => {
            return value === getConfirmValue() ?
                undefined :
                message || "Giá trị nhập vào không chính xác";
        },
    };
};