#!/bin/bash
# flyfish演示站部署脚本

yarn build && \
cp ./example/* ./dist && \
 zip -r dist.zip ./dist && \
  scp -P 16922 ./dist.zip wybaby168@dns.flyfish.dev:~ && \
   rm -rf dist.zip
