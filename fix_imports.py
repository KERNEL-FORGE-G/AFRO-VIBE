import os

files = ['src/screens/LoginScreen.js', 'src/screens/RegisterScreen.js', 'src/screens/WelcomeScreen.js']

for filepath in files:
    with open(filepath, 'rb') as f:
        content = f.read()

    # Fix the missing comma between StatusBar and Animated
    content = content.replace(b'StatusBar  Animated', b'StatusBar,\r\n  Animated')

    with open(filepath, 'wb') as f:
        f.write(content)
