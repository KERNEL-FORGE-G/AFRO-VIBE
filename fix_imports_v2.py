import os

files = ['src/screens/LoginScreen.js', 'src/screens/RegisterScreen.js', 'src/screens/WelcomeScreen.js']

for filepath in files:
    with open(filepath, 'rb') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        if b'StatusBar' in line and b'Animated' not in line:
             new_lines.append(line.replace(b'StatusBar', b'StatusBar,'))
        else:
             new_lines.append(line)

    with open(filepath, 'wb') as f:
        f.writelines(new_lines)
