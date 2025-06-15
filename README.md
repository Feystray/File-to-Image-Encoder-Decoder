It's a script that can be used to encode any file to a corresponding PNG image file. 

# Example

### To Encode a file to image
```
node index.js e -i "input.pdf" -o "output.png" -r 16:9
```
Here, `input.pdf` is Input File, `output.png` is Output File which is optional  and `16:9` is aspect ratio (optional, default=1:1)

### To decode an image to file
```
node index.js d -i "input.png"
```
Here, `input.png` is Input Image file to decode and it will be decoded to same folder as `input.png` is.
