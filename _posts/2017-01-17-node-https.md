---
layout: default
title: node服务器部署https
category: TECHNIQUE
tags: NODEJS HTTPS
---

这个是16年年末时做的一项工作。随着苹果公司宣布在2017年后上架其商店的App，内部不得含有不安全的协议调用，换句话说，提供给app的接口调用，如http这样的，都必须使用安全的https协议。

https具体的概念，可以通过维基百科自行查询。本文主要介绍如何在node.js服务器上部署免费的https证书。关于本文用到的Let's Encrypt证书签发服务，具体介绍可以在其官网上看。

<!-- excerpt -->

---

### 服务器私钥

Let's Encrypt服务需要在远程验证域名服务器的真实性，才会颁发证书。服务器需要提供唯一识别的密钥进行识别操作。

```shell
openssl genrsa -out ca-key.pem -des 4096
```

这个操作为我们创建一个验证私钥，这时，这个私钥将会代表这台服务器对服务验证进行加密。创建时带-des，openssl要求填写密码。加密后，我们使用这个验证私钥验证证书时，都要输入密码。如果未来需要自动化更新证书有效期，为了简单，可以不设密码，去掉-des参数即可。

```shell
openssl genrsa -out server-key.pem 4096
```

这次的操作与上一次雷同，区别在于这次的私钥将会用于产生服务公钥。

```shell
openssl req -new -key server-key.pem -config openssl.cnf -out server-csr.pem
```

在执行这个命令之前，我们要在当前目录创建一个配置文件，内容大概是域名主体信息，包括主体所在国家地区、所属公司组织或机构：

```properties
[req]
  distinguished_name = req_distinguished_name
  req_extensions = v3_req

  [req_distinguished_name]
  countryName = Country Name (2 letter code)  
  countryName_default = CN  
  stateOrProvinceName = State or Province Name (full name)  
  stateOrProvinceName_default = Guangdong
  localityName = Locality Name (eg, city)  
  localityName_default = Guangzhou
  organizationName = Organization Name (eg, company)
  organizationName_default = Ghost Ltd.
  organizationalUnitName  = Organizational Unit Name (eg, section)  
  organizationalUnitName_default = Daily Task Project
  commonName = Common Name (e.g. server FQDN or YOUR name)
  commonName_default = ghold.bid
  commonName_max  = 64
  email = Email Address
  email_default = gholdnet@gmail.com

  [v3_req]  
  # Extensions to add to a certificate request  
  basicConstraints = CA:FALSE  
  keyUsage = nonRepudiation, digitalSignature, keyEncipherment  
  subjectAltName = @alt_names  

  [alt_names]  
  # 注意这个设置，配置的域名将会被Let's Encrypt服务逐个验证
  DNS.1 = www.ghold.bid
  DNS.2 = ghold.bid
```

域名如需提供更多信息，可以找到[配置模板](http://web.mit.edu/crypto/openssl.cnf)。

执行命令的结果是输出服务器公钥。有了`ca-key.pem`和`server-csr.pem`，执行Let's Encrypt服务的第一步算是完成。

---

### 启动一个http服务用于验证

Let's Encrypt服务证书签发协议使用ACME协议，即通过脚本生成验证文件到固定目录下，通过http的方式本地下载校验一次，通过http的方式远程下载校验一次。因此，我们必须要在指定的目录启动的http服务。即使在以后自动化更新证书有效期，也是需要启动http服务，要么就一直不关闭。

```shell
wget https://raw.githubusercontent.com/diafygi/acme-tiny/master/acme_tiny.py
```

先从脚本文件`acme_tiny.py`分析一下。这个脚本来自于[Github](https://github.com/diafygi/acme-tiny)，为验证服务提供了整套流程，大大提高了部署效率。启动http服务的目标是为脚本提供临时验证文件的获取。在脚本中我们可以看到带有`.well-known/acme-challenge/`的目录。这个目录是不可以更改的，而且启动的http服务中必须包含这个目录路径。目的是可以通过`http://host/.well-known/acme-challenge/`下载到验证文件。还有一点是，端口必须是80端口。

```shell
python -m SimpleHTTPServer 80 # root user exec, python 2
python -m http.server 80 # root user exec, python 3
```

如果要使用80端口，就要求我们拥有root的权限去启动这一步http服务。要么就是使用端口代理的方式，不过前提也是需要root配置代理，区别不大。

---

### 执行验证，生成签名，合成证书

一切准备完毕后，就可以执行`acme_tiny.py `脚本生成签名。执行的代码在脚本注释里有写到：

```shell
python acme_tiny.py --account-key ./ca-key.pem --csr ./server-csr.pem \
--acme-dir /path/to/.well-known/acme-challenge/ > signed.crt
```

生成`signed.crt`后，接下来是下载Let's Encrypt服务提供的顶级证书，并加以合成。此步骤说明参看参考文档[^1]

```shell
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > chained.pem
```

一般来说，使用node部署https需要的证书到这步即可。如果要执意使用OCSP Stapling请自行研究。

---

### node部署与自动化更新

[^2]在node启动时，加入

```javascript
let options = {
   key: fs.readFileSync('path/to/server-key.pem'),
   cert: fs.readFileSync('path/to/chained.pem'),
};
https.createServer(options, app).listen(settings.server_https_port); // 默认443
```

由于大部分入口都会信任Let's Encrypt提供的顶级证书，所以在浏览器上访问会自动安装我们的证书，从而不需要在使用api时做配置。

`acme_tiny.py`中也提供了crontab定时任务方案，可以简单做点自动化更新证书，最后记得把证书放对位置，重启服务即可。

> 参考文档：

[^1]: [Let's Encrypt，免费好用的 HTTPS 证书](https://imququ.com/post/letsencrypt-certificate.html)

[^2]: [用Node.js创建自签名的HTTPS服务器](https://cnodejs.org/topic/54745ac22804a0997d38b32d)
