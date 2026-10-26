<?php

namespace Tests\Unit;

use App\Support\R2\SigV4;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class SigV4Test extends TestCase
{
    /** "GET Object" example from the AWS Signature Version 4 documentation. */
    public function test_it_matches_the_official_aws_test_vector(): void
    {
        $signer = new SigV4('AKIAIOSFODNN7EXAMPLE', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'us-east-1', 's3');

        $headers = $signer->sign(
            'GET',
            '/test.txt',
            [],
            ['host' => 'examplebucket.s3.amazonaws.com', 'range' => 'bytes=0-9'],
            hash('sha256', ''),
            new DateTimeImmutable('2013-05-24 00:00:00 UTC'),
        );

        $this->assertSame(
            'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, '
            .'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, '
            .'Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41',
            $headers['authorization'],
        );
    }
}
