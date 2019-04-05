#!/bin/bash

# convenient delete options for containers
read -p "Would you like to delete some containers? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then 
	echo "Ok, let's kill some containers. If you would like to delete all containers type 'all' if you want to delete all containers except for excluded containers type 'e <container-name1> [<container-name2>...]' if you want to delete containers in an inclusive list enter 'i <container-name1> [<container-name2>...]'."
	while true; do
	echo "Please enter your delete option: "
	read -a ans
	case ${ans[0]} in 
	all)
		docker rm $(docker ps -a -q)
		echo; echo "Removal Success!!!"
		break;;
	i)
		docker rm ${ans[@]:1}
		echo; echo "Removal Success!!!"
		break;;
	e)
		read -a del_list <<< $(docker ps -a -q)
		for i in "${ans[@]:1}" 
		do
        	del_list=(${del_list[@]//*$i*})
		done
		docker rm ${del_list[@]}
		echo; echo "Removal Success!!!"
		break;;
	*) 
		echo "That does not seem like a valid delete option use first arg [all, e, i] "
		;;
	esac
	done
fi

# next up is image delete

read -p "Would you like to delete some Images? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Valid delete options use first arg [all, e, i]. Please note, this deletes IMAGES, not containers."
    while true; do
    echo "Please enter your delete option: "
    read -a ans
    case ${ans[0]} in
    all)
		docker rmi $(docker images -q)
        echo; echo "Removal Success!!!"
        break;;
    i)
        docker rmi ${ans[@]:1}
        echo; echo "Removal Success!!!"
        break;;
    e)
        read -a del_list <<< $(docker images -q)
        for i in "${ans[@]:1}"
        do
            del_list=(${del_list[@]//*$i*})
        done
        docker rmi ${del_list[@]}
        echo; echo "Removal Success!!!"
        break;;
    *)
        echo "That does not seem like a valid delete option use first arg [all, e, i] "
        ;;
    esac
    done
fi


