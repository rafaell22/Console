# Console
Simple console for usage in mobile browsers

## Features
- Create a button that opens/close a makeshift console;
- The console displays anything logged with console.log and console.error (it overwrites the original declaration of each of those functions);
- Different variable types are displayed with different colors;
- The user can drag the console button around the screen if it is covering anything important (press, hold for 0.5s and then drag);

## Usage
- Import the JS and CSS files in the header of the HTML. The library loads itself from then.

```html
<html>
  <header>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="../console.css">
    <style>
    </style>
    
    <script src="../console.js"></script>
  </header>
  <body></body>
</html>
```