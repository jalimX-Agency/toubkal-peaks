<?php

namespace App\Enums;

enum ReviewSource: string
{
    case Google = 'google';
    case Tripadvisor = 'tripadvisor';
    case Viator = 'viator';
    case GetYourGuide = 'getyourguide';
    case Facebook = 'facebook';
    case Trustpilot = 'trustpilot';
    case Website = 'website';
    case Other = 'other';
}
