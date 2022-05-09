# Captcha Generator

Simple project that generates captchas in the browser. [Try it out!](https://tobiaskiehnlein.github.io/CaptchaGenerator/)

## Setup
Install dependencies using `npm install`.
Run the application locally using `npm start`.

## API
- "/": Display basic website which can download captcha
- "/generateCaptchas": returns a list of captchas in the following format (optional parameter: amount = 1)
```json5
[
    {
        "text": "text of the captcha",
        "base64": "data:image/png;base64,iVBORw0KGgo..."
    },
    // ...
]
```
