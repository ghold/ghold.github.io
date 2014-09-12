---
layout: default
title: tesseract识别验证码
category: TECHNIQUE
tags: PYTHON TESSERACT
---

最近在折腾一个玩意：验证码识别。起因是部门推自动化测试，而公司软件统一登录入口有个验证码输入框。虽然可以让维护人员改成固定或屏蔽掉（现在还真屏蔽了-_-），不过我还是选择了折腾一下把它破解。

架构：

**eric5+python3.3+pillow2.0.0+pyocr0.1.2+tesseract3.02+cowboxer1.02+windows**

最近半年在接触python，一直使用eric，挺不错。当然不是很精通eric，譬如还不会debug功能怎么用。本次开发使用了流行的开源光学识别库tesseract，本人能力有限，不讨论底层的东西，只说说我对它的使用。Pyocr是连接python和tesseract的桥梁，其实有更好的python-tesseract项目，待会讲到pyocr时再说理由。

<!-- excerpt -->

###今天的主角：

![alt text](/assets/img/2013_06_25/1.jpg "原始验证码")

相对那些又斜体又加横线甚至还有中文的图来说，本文主角属简单的角色。不过要追求完美表现，在这里使用pillow对其进行一点修饰。岔开一下话题，pillow是PIL（python图像库）在python3.3的优化兼容版，也是非常强大。我把主角转换为灰度图，在把亮度增强为2.5倍，设定灰度的界为200，高于设为白色，低于设为黑色，去掉边框，化妆后的图：

![alt text](/assets/img/2013_06_25/2.jpg "转换后")

###这里有个注意点：

 - 图片大小。原图只有96×30大小，在之后训练traineddata时比较恶心，建议尽量放大点（这里放大了5倍）
 - 保存质量。开始时不懂这个属性，导致保存的图会出现灰色的斑点，影响识别质量。后来在google上查找“PIL如何保存高质量图”时找到了答案：

`im.save(mImgFile, 'JPEG', quality = 100)`
	
使用tesseract自带的eng. Traineddata进行识别时会出现不同程度错判，譬如会出现特殊符号、无法判断出结果。先来解决第一个问题。根据我拿到的验证码规律，是由数字和小写英文字母组成，所以我觉得自行训练一个traineddata。Traineddata是提供给tesseract进行光学识别使用的，自行训练的traineddata可提高特定类似字体的识别准确率。

开始时我参考这篇文章进行操作，对快速入门非常有用。下面简述我的过程：

####选取训练集和测试集

由于要识别的主角比较简单，我大概选择了50个图片，分4批：6、12、24、8，其中8时测试集

####生成训练集box

开始时我跟着参考文章走，结果发现一个现象，有些图片无论如何都无法产生box，或是如果自行添加box，在训练时也会报错。这个问题我一直以为是tesseract的主观意识（就是bug了）。我把这些图片列为Bad Imgs。

直至看到一篇文章上提到了一下关于tesseract3的一个特性参数psm。如果安装了tesseract3，可以在cmd或者shell中输入tesseract查看。这个特性有11个参数，我没有根究默认是什么参数，反正如果时一列字符串建议选择7。

`tesseract eng.ver.001.jpg eng.ver.001 -l eng –psm 7 batch.nochop makebox `

如果后期生成了test. Traineddata，也可以使用

`tesseract eng.ver.001.jpg eng.ver.001 -l eng –psm 7 batch.nochop makebox`

为了懒惰，自己已经写成py文件了

####修改box

体力活，开始时没有放大图片，修改时简直可以让视力降低几百度。使用cowboxer打开box文件，调整框框的大小和对应的字符。具体查看cowboxer的帮助

####训练box，产生tr文件

`tesseract eng.ver.001.jpg eng.ver.001 –psm 7 nobatch box.train`

每个box执行一次。注意，这里也要加上psm参数，不然可能会报错。

####产生字符集

`unicharset_extractor eng.ver.001.tr eng.ver.002.tr eng.ver.003.tr` 

让tesseract知道可以识别什么字符  

####生成inttemp（图像原型）、shapetable和pffmtable（字符出现次数）文件

`mftraining -U unicharset -O test.unicharset eng.ver.001.tr eng.ver.002.tr eng.ver.003.tr`

输出几个生成训练集必须的文件

**这步遇到了一个问题，参看文章（已丢失），但这篇文章是直接摘抄googlecode里的描述翻译了一下，没有给出解决办法。以下是笔者的解决方法：**

 - 需要一个合适的命名。Tesseract的文档中强调了图像的命名格式——[lang].[fontname].exp[num].tif，并不是毫无意义的，其中fontname字段的存在最为重要。验证方式在第4步的执行中输出font为ver
 - 需要一个font_properties文件。开始时由于命名问题，一直不知道网上说这个文件要配置的Font是啥。其实就是简单的把ver 0 0 0 0 0和回车加上，保存为无-BOM UTF-8 UNIX换行符即可。

####生成normproto文件（具体也不清楚干啥的）

`cntraining eng.ver.001.tr eng.ver.002.tr eng.ver.003.tr`

####把6、7出现的文件的文件名改成test.前缀，见参考文章

####合成test. traineddata

`combine_tessdata test. `

还是为了懒惰，4-9步已合成一个py

####循环移上步骤不断修正test.traineddata

最后，主角回归，使用pycor对测试集进行识别。选择pycor的一个重要原因是，pycor和python-tesseract都不支持python3.3。我尝试过对python-tesseract的源码进行编译python3.3的版本，可惜水平不够，只能失败告终。而pycor源码比较简单，只是判断识别码的话足够了，而且对python3.3的兼容性优化几步搞掂。在这个小项目期间还发现了pycor不支持psm参数，自行添加上了。

结果令人满意，测试集的准确率达到100%。实际上用在自动化测试中也是没发现问题（当然，人家都屏蔽了-_-）


> Written with [StackEdit](https://stackedit.io/).