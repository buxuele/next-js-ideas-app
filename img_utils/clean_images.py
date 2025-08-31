import os
import uuid
from PIL import Image # pip install Pillow

# 下面这一行，实际上用了！
import pillow_avif # pip install Pillow pillow-avif-plugin
# https://stackoverflow.com/questions/74527775/how-to-convert-avif-to-png-with-python


# 把全部的图片，都转为 jpg, 然后保存到桌面
def convert_image_to_jpg(source="./", output_suffix="jpg"):
    output_dir = r"C:\Users\Administrator\Desktop\temp_" + str(uuid.uuid4())[:8]
    os.makedirs(output_dir, exist_ok=True)

    for img_name in os.listdir(source):
        # 1. 输入文件名
        img_path = os.path.join(source, img_name)

        # 2. 输出文件名
        prefix, suffix = os.path.splitext(img_name)
        output_name = os.path.join(output_dir, f"{prefix}.{output_suffix}")
        print("output_name:", output_name)

        # 3. 文件类型转换
        im = Image.open(img_path)
        rgb_im = im.convert('RGB')  # OSError: cannot write mode RGBA as JPEG
        rgb_im.save(output_name)

    print("Done")
    os.system(f" start {output_dir}") #  打开文件夹！！


if __name__ == '__main__':
    p = r" D:\next_js\next-js-ideas-app\public\imgs\fabmom12   ".strip()
    convert_image_to_jpg(p)






