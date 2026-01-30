output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_rest_api.bedrock_api.execution_arn}/prod/query"
}

output "api_url" {
  description = "Full API URL for testing"
  value       = "https://${aws_api_gateway_rest_api.bedrock_api.id}.execute-api.us-east-1.amazonaws.com/prod/query"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.bedrock_rag.function_name
}
