# Script to add Vercel environment variables

$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://cihmiaytrnvvvbxwoxrb.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "sb_publishable_Iox6-OSbDbNzdrs_f0VXHw_a5dWQsAz"
    "SUPABASE_SERVICE_ROLE_KEY" = "PASTE_YOUR_SERVICE_ROLE_KEY_HERE"
    "GROQ_API_KEY" = "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"
    "CANVAS_API_URL" = "https://ciit.instructure.com/api/v1"
    "CANVAS_ACCESS_TOKEN" = "12921~7hmGckGktWFcNRZJuKCHYXMukf7E7rwre9KTAmkGxATW6zw7fyNNXneMZWKHf4JQ"
}

Write-Output "=== Adding environment variables to Vercel ==="
Write-Output "NOTE: For SUPABASE_SERVICE_ROLE_KEY, get it from:"
Write-Output "Supabase Dashboard > Project Settings > API > service_role key"
Write-Output ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    if ($value -eq "PASTE_YOUR_SERVICE_ROLE_KEY_HERE") {
        Write-Output "SKIPPING: $key (need to paste your service role key)"
        continue
    }
    
    Write-Output "Adding: $key"
    echo $value | vercel env add $key production --yes 2>&1
    Write-Output ""
}
