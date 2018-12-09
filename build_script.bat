@echo off

cd src

gcloud app deploy --version fulfillment --project gcloudpjf

cd ..

cmd /k
PAUSE

