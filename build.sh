#!/bin/bash
# flyfish演示站部署脚本

yarn build && \
cp ./example/* ./dist && \
 zip -r dist.zip ./dist && \
  scp -P 16922 ./dist.zip ec2-user@54.248.49.16:~ && \
   rm -rf dist.zip
