import * as cdk from 'aws-cdk-lib';
import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, BucketEncryption, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = this.createS3Bucket();
    this.deployS3Bucket(s3Bucket);
    const s3Origin = this.createOriginAccess(s3Bucket);
    this.createCfnDistribution(s3Origin);
  }

  private createS3Bucket(): IBucket {
    return new Bucket(this, 'lommepenge-bucket', {
        bucketName: 'lommepenge-179454298130',
        encryption: BucketEncryption.S3_MANAGED,
        publicReadAccess: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true
    });
  }

  private deployS3Bucket(s3Bucket: IBucket) {
    new BucketDeployment(this, 'deploy-lommepenge', {
        sources: [Source.asset('../pwa')],
        destinationBucket: s3Bucket
    });
  }

  private createOriginAccess(s3Bucket: IBucket): S3Origin {
    const originAccess = new OriginAccessIdentity(this, 'OriginAccessControl', {comment: 'Lommepenge'});
    return new S3Origin(s3Bucket, {originAccessIdentity: originAccess})
  }

  private createCfnDistribution(s3Origin: S3Origin): Distribution {
    return new Distribution(this, 'lommepenge-cfn-distribution', {
        defaultBehavior: {
            origin: s3Origin,
            viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
        },
        errorResponses: [
            {
                httpStatus: 403,
                responsePagePath: '/index.html',
                responseHttpStatus: 200
            }
        ],
    });
  }  
}

module.exports = { FrontendStack };
