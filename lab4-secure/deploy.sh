#!/bin/bash

echo "🚀 Deploying AJE Delivery Angular App to S3..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Angular app
echo "🔨 Building Angular application..."
npm run build:prod

# Create S3 infrastructure
echo "🏗️  Creating S3 infrastructure..."
terraform init
terraform apply -auto-approve

# Get bucket name
BUCKET_NAME=$(terraform output -raw bucket_name)
echo "📦 S3 Bucket: $BUCKET_NAME"

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync dist/aje-delivery-assistant/ s3://$BUCKET_NAME --delete --profile default

# Get website URL
WEBSITE_URL=$(terraform output -raw website_url)

echo ""
echo "✅ Deployment complete!"
echo "🌐 Website URL: $WEBSITE_URL"
echo ""
echo "🧪 Test the application:"
echo "curl -I $WEBSITE_URL"
