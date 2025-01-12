#!/opt/homebrew/opt/node/bin/node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

new FrontendStack(app, 'FrontendStack', {});
new ApiStack(app, 'ApiStack', {});