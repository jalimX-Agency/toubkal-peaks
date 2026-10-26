<?php

namespace App\Support\R2;

use DateTimeInterface;

/**
 * Minimal AWS Signature Version 4 signer (enough for Cloudflare R2 / any S3-compatible API).
 */
final class SigV4
{
    public function __construct(
        private readonly string $accessKey,
        private readonly string $secretKey,
        private readonly string $region = 'auto',
        private readonly string $service = 's3',
    ) {}

    /**
     * @param  array<string,string>  $query
     * @param  array<string,string>  $headers  must contain "host"; every header given here is signed
     * @return array<string,string> all headers to send (lower-case names), including authorization
     */
    public function sign(string $method, string $canonicalUri, array $query, array $headers, string $payloadHash, DateTimeInterface $now): array
    {
        $amzDate = gmdate('Ymd\THis\Z', $now->getTimestamp());
        $date = substr($amzDate, 0, 8);

        $normalized = [];
        foreach ($headers as $name => $value) {
            $normalized[strtolower($name)] = trim(preg_replace('/\s+/', ' ', (string) $value));
        }
        $normalized['x-amz-date'] = $amzDate;
        $normalized['x-amz-content-sha256'] = $payloadHash;
        ksort($normalized);

        $canonicalHeaders = '';
        foreach ($normalized as $name => $value) {
            $canonicalHeaders .= $name.':'.$value."\n";
        }
        $signedHeaders = implode(';', array_keys($normalized));

        $pairs = [];
        foreach ($query as $k => $v) {
            $pairs[rawurlencode((string) $k)] = rawurlencode((string) $v);
        }
        ksort($pairs);
        $canonicalQuery = implode('&', array_map(fn ($k, $v) => $k.'='.$v, array_keys($pairs), $pairs));

        $canonicalRequest = implode("\n", [$method, $canonicalUri, $canonicalQuery, $canonicalHeaders, $signedHeaders, $payloadHash]);
        $scope = "$date/{$this->region}/{$this->service}/aws4_request";
        $stringToSign = implode("\n", ['AWS4-HMAC-SHA256', $amzDate, $scope, hash('sha256', $canonicalRequest)]);

        $kDate = hash_hmac('sha256', $date, 'AWS4'.$this->secretKey, true);
        $kRegion = hash_hmac('sha256', $this->region, $kDate, true);
        $kService = hash_hmac('sha256', $this->service, $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
        $signature = hash_hmac('sha256', $stringToSign, $kSigning);

        $normalized['authorization'] = "AWS4-HMAC-SHA256 Credential={$this->accessKey}/$scope, SignedHeaders=$signedHeaders, Signature=$signature";

        return $normalized;
    }
}
