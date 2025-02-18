# Installation

```
npm install
```

# Start

```
npm run start
```

    /docs - Files to Docs
        /openapi.yml - For OpenAPI Docs(http://localhost:4000)
        /postman_collection.json - Postman collection if you prefer use Postman
    /static - Converted Files
    /uploads - Uploaded Files
    

# API

    POST/upload - To upload an single file & convert it
        Header
            Content-Type - multipart/form-data
        Body
            file - .MOV File
        Returns 
            {
                link: "{{url}}/upload/:filename"
            }

    
    GET/upload/:filename - Download converted file
        Path Params
            filename - Name of file to download
