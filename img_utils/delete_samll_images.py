import os


#  删掉小图片。
def delete_images(folder, limit_size_in_kb=200):
    total = os.listdir(folder)
    print(f"删除之前，图片数量是: {len(total)}")

    for img in os.listdir(folder):
        img_file = os.path.join(folder, img)

        bytes_size = os.path.getsize(img_file)
        kb_size = int(bytes_size / 1024)
        if kb_size < limit_size_in_kb:
            os.remove(img_file)

    after = os.listdir(folder)
    print(f"删除之后，图片数量是: {len(after)}")

if __name__ == '__main__':

    # 在这里传入文件夹的名称
    folder_name = r" C:\Users\Administrator\Desktop\temp_7517e160  ".strip()
    delete_images(folder_name, limit_size_in_kb=100)


