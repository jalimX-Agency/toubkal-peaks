<?php

namespace App\Enums;

enum TourStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
