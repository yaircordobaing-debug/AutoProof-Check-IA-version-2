import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of Admin CarFleet block
carfleet_start = content.find('<!-- Admin CarFleet -->')
if carfleet_start != -1:
    end_div1 = content.find('</div>', carfleet_start)
    end_div2 = content.find('</div>', end_div1 + 1)
    end_div3 = content.find('</div>', end_div2 + 1)
    
    super_admin_html = '''
                            <!-- Super Admin Global -->
                            <div onclick="window.appActions.fillCredentials('super@autoproof.co', 'super')" 
                                 class="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer flex justify-between items-center group/item col-span-2">
                                <div>
                                    <div class="flex items-center gap-1.5">
                                        <i class="fa-solid fa-globe text-purple-400 text-[10px]"></i>
                                        <span class="text-xs font-bold text-white">Super Admin Global</span>
                                    </div>
                                    <p class="text-[9px] text-gray-400">Dueño del SaaS</p>
                                </div>
                                <span class="text-[9px] text-purple-400 group-hover/item:translate-x-1 transition-transform"><i class="fa-solid fa-key"></i></span>
                            </div>'''
    
    new_content = content[:end_div3+6] + super_admin_html + content[end_div3+6:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Added Super Admin to index.html")
else:
    print("Could not find Admin CarFleet in index.html")
