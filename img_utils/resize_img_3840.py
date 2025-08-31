import os
import shutil
from PIL import Image
import uuid

Image.MAX_IMAGE_PIXELS = None
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff')

# 如果图片的宽度大于  3840， 缩小为 3840， 高度自动适应！


def batch_resize_images(input_dir, target_width):
    output_dir = r"C:\Users\Administrator\Desktop\temp_" + str(uuid.uuid4())[:8]
    os.makedirs(output_dir, exist_ok=True)

    # 检查输出文件夹是否存在，如果不存在则创建
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"创建输出文件夹：{output_dir}")

    # 遍历输入文件夹中的所有文件
    files = os.listdir(input_dir)
    total_files = len(files)
    processed_count = 0

    print(f"\n开始处理 {input_dir} 中的图片...")

    for index, filename in enumerate(files):
        # 检查文件是否是支持的图片格式
        if not filename.lower().endswith(IMAGE_EXTENSIONS):
            continue

        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)

        # 打开图片
        with Image.open(input_path) as img:
            width, height = img.size

            # 检查宽度是否大于目标宽度
            if width > target_width:
                # 计算新的高度以保持宽高比
                new_height = int(target_width * (height / width))

                print(f"[{index +1}/{total_files}] 正在缩小: {filename} ({width}x{height} -> {target_width}x{new_height})")

                # 使用高质量的LANCZOS算法进行缩放
                resized_img = img.resize((target_width, new_height), Image.Resampling.LANCZOS)

                # 保存缩小后的图片
                # 对于JPEG格式，可以指定质量参数以获得更好的效果
                if filename.lower().endswith(('.jpg', '.jpeg')):
                    resized_img.save(output_path)
                else:
                    resized_img.save(output_path)

                processed_count += 1

            else:
                # 如果宽度不大于目标宽度，直接复制原文件
                print(f"[{index +1}/{total_files}] 尺寸符合，直接复制: {filename} ({width}x{height})")
                shutil.copy2(input_path, output_path)

    print(f"\n处理完成！")


# 当直接运行此脚本时，执行以下代码
if __name__ == "__main__":

    INPUT_FOLDER = r" C:\Users\Administrator\Desktop\temp_ffcd10b6 ".strip()

    batch_resize_images(INPUT_FOLDER, 3840)







